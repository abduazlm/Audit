import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import perplexity_search as ps


def _page(url, title="t", snippet="s"):
    return SimpleNamespace(
        title=title, url=url, snippet=snippet, date=None, last_updated=None
    )


class FakeClient:
    def __init__(self, pages):
        self.calls = []
        self.search = SimpleNamespace(create=self._create)
        self._pages = pages

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(results=self._pages)


def test_dedupes_by_url_keeping_first():
    client = FakeClient(
        [_page("https://a"), _page("https://b"), _page("https://a", "dup")]
    )
    results = ps.search(["q1", "q2"], client=client)
    assert [r.url for r in results] == ["https://a", "https://b"]
    assert results[0].title == "t"


def test_single_query_sent_as_string_and_params_forwarded():
    client = FakeClient([])
    ps.search("hello", max_results=3, country="US", client=client)
    assert client.calls == [{"query": "hello", "max_results": 3, "country": "US"}]


def test_multi_query_sent_as_list():
    client = FakeClient([])
    ps.search(["a", "b"], client=client)
    assert client.calls[0]["query"] == ["a", "b"]


@pytest.mark.parametrize(
    "kwargs",
    [
        {"query": []},
        {"query": " "},
        {"query": ["x"] * 6},
        {"query": "x", "max_results": 21},
    ],
)
def test_validation(kwargs):
    with pytest.raises(ps.SearchError):
        ps.search(client=FakeClient([]), **kwargs)


def test_missing_key(monkeypatch):
    monkeypatch.delenv("PERPLEXITY_API_KEY", raising=False)
    with pytest.raises(ps.SearchError, match="PERPLEXITY_API_KEY"):
        ps.search("x")


class RaisingClient:
    def __init__(self, exc):
        self.search = SimpleNamespace(create=self._create)
        self._exc = exc

    def _create(self, **kwargs):
        raise self._exc


def _status_error(cls, status):
    import httpx

    request = httpx.Request("POST", "https://api.perplexity.ai/search")
    response = httpx.Response(status, request=request)
    return cls("boom", response=response, body=None)


@pytest.mark.parametrize(
    ("exc", "match"),
    [
        (_status_error(ps.perplexity.AuthenticationError, 401), "401"),
        (_status_error(ps.perplexity.RateLimitError, 429), "429"),
        (_status_error(ps.perplexity.InternalServerError, 500), "500"),
    ],
)
def test_api_errors_wrapped(exc, match):
    with pytest.raises(ps.SearchError, match=match):
        ps.search("x", client=RaisingClient(exc))


def test_connection_error_wrapped():
    import httpx

    exc = ps.perplexity.APIConnectionError(
        request=httpx.Request("POST", "https://api.perplexity.ai/search")
    )
    with pytest.raises(ps.SearchError, match="could not reach"):
        ps.search("x", client=RaisingClient(exc))


def test_cli_missing_key_exits_1(monkeypatch, capsys):
    monkeypatch.delenv("PERPLEXITY_API_KEY", raising=False)
    assert ps.main(["test query", "-n", "3"]) == 1
    captured = capsys.readouterr()
    assert captured.out == ""
    assert "PERPLEXITY_API_KEY is not set" in captured.err


def test_cli_prints_json(monkeypatch, capsys):
    client = FakeClient([_page("https://a"), _page("https://a")])
    monkeypatch.setattr(ps, "_make_client", lambda max_retries: client)
    assert ps.main(["q", "-n", "3", "--domain", "example.com"]) == 0
    import json

    out = json.loads(capsys.readouterr().out)
    assert [r["url"] for r in out] == ["https://a"]
    assert client.calls[0]["search_domain_filter"] == ["example.com"]
    assert client.calls[0]["max_results"] == 3
