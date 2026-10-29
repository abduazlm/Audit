"""Person matte for a time range of assets/source.mp4 → assets/matte-<name>.mp4 (grayscale alpha), for the cut-out scenes.
usage: python3 matte.py START_S DUR_S NAME   (only the cut-out scenes need a matte)
torchvision DeepLabV3-ResNet101 (person class) at reduced size, temporal smoothing,
then an edge-aware guided filter against the full-res frame so hair and shoulders stay clean."""
import subprocess, sys, numpy as np, torch, cv2
START, DUR, NAME = sys.argv[1], sys.argv[2], sys.argv[3]
from torchvision.models.segmentation import deeplabv3_resnet101, DeepLabV3_ResNet101_Weights
W, H, FPS = 1080, 1920, 25
w = DeepLabV3_ResNet101_Weights.DEFAULT
model = deeplabv3_resnet101(weights=w).eval()
PERSON = w.meta['categories'].index('person')
mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1); std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', START, '-t', DUR, '-i', 'assets/source.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', f'assets/matte-{NAME}.mp4'], stdin=subprocess.PIPE)
prev = None; n = 0
torch.set_num_threads(max(1, torch.get_num_threads()))
with torch.no_grad():
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        small = cv2.resize(img, (432, 768), interpolation=cv2.INTER_AREA)
        x = (torch.from_numpy(small).permute(2, 0, 1).float() / 255 - mean) / std
        prob = model(x.unsqueeze(0))['out'].softmax(1)[0, PERSON].numpy()
        if prev is not None: prob = .6 * prob + .4 * prev               # temporal smoothing against flicker
        prev = prob
        a = cv2.resize(prob.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
        a = cv2.ximgproc.guidedFilter(img, a, 12, 1e-4)                   # snap the edge to the image
        a = np.clip((a - .35) / .3, 0, 1)
        enc.stdin.write((a * 255).astype(np.uint8).tobytes())
        n += 1
        if n % 75 == 0: print('frame', n, flush=True)
enc.stdin.close(); enc.wait(); print('done', n)
