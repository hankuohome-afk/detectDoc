const E = (x, c, t) => {
  if (c in x) {
    return Object.defineProperty(x, c, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: t,
    });
  }
  return (x[c] = t);
};
const C = (x, c, t) => {
  E(x, typeof c !== "symbol" ? `${c}` : c, t);
  return t;
};
export class DocumentScanner {
  constructor() {
    C(this, "cv");
    if ("cv" in window) {
      this.cv = window.cv;
    } else {
      throw new Error("OpenCV not found");
    }
  }
  detect(c) {
    let t = this.cv;
    const n = t.imread(c);
    const o = new t.Mat();
    t.cvtColor(n, o, t.COLOR_RGBA2GRAY);
    const e = new t.Mat();
    t.GaussianBlur(o, e, new t.Size(5, 5), 0, 0, t.BORDER_DEFAULT);
    const d = new t.Mat();
    t.threshold(e, d, 0, 255, t.THRESH_BINARY + t.THRESH_OTSU);
    let l = new t.MatVector();
    let u = new t.Mat();
    t.findContours(d, l, u, t.RETR_CCOMP, t.CHAIN_APPROX_SIMPLE);
    let m = 0;
    let a = -1;
    for (let f = 0; f < l.size(); ++f) {
      let s = t.contourArea(l.get(f));
      if (s > m) {
        m = s;
        a = f;
      }
    }
    const i = l.get(a);
    const h = this.getCornerPoints(i);
    n.delete();
    o.delete();
    e.delete();
    d.delete();
    l.delete();
    u.delete();
    return h;
  }
  crop(c, t, n, o) {
    const e = this.cv;
    const d = document.createElement("canvas");
    const l = e.imread(c);
    if (!t) {
      t = this.detect(c);
    }
    let u = new e.Mat();
    if (!n) {
      n = Math.max(this.distance(t[0], t[1]), this.distance(t[2], t[3]));
    }
    if (!o) {
      o = Math.max(this.distance(t[0], t[3]), this.distance(t[1], t[2]));
    }
    let m = new e.Size(n, o);
    let a = e.matFromArray(4, 1, e.CV_32FC2, [
      t[0].x,
      t[0].y,
      t[1].x,
      t[1].y,
      t[3].x,
      t[3].y,
      t[2].x,
      t[2].y,
    ]);
    let i = e.matFromArray(4, 1, e.CV_32FC2, [0, 0, n, 0, 0, o, n, o]);
    let h = e.getPerspectiveTransform(a, i);
    e.warpPerspective(
      l,
      u,
      h,
      m,
      e.INTER_LINEAR,
      e.BORDER_CONSTANT,
      new e.Scalar(),
    );
    e.imshow(d, u);
    l.delete();
    u.delete();
    return d;
  }
  distance(c, t) {
    return Math.hypot(c.x - t.x, c.y - t.y);
  }
  getCornerPoints(c) {
    let t = this.cv;
    let n = [];
    const center = t.minAreaRect(c).center;
    let d;
    let l = 0;
    let u;
    let m = 0;
    let a;
    let i = 0;
    let h;
    let f = 0;
    for (let s = 0; s < c.data32S.length; s += 2) {
      const r = {
        x: c.data32S[s],
        y: c.data32S[s + 1],
      };
      const y = this.distance(r, center);
      if (r.x < center.x && r.y < center.y) {
        if (y > l) {
          d = r;
          l = y;
        }
      } else if (r.x > center.x && r.y < center.y) {
        if (y > m) {
          u = r;
          m = y;
        }
      } else if (r.x < center.x && r.y > center.y) {
        if (y > i) {
          a = r;
          i = y;
        }
      } else if (r.x > center.x && r.y > center.y && y > f) {
        h = r;
        f = y;
      }
    }
    n.push(d);
    n.push(u);
    n.push(h);
    n.push(a);
    return n;
  }
}
const window_Dynamsoft = window.Dynamsoft;
const v = document.createElement("canvas");
export class OpenCVDocumentDetectHandler
  extends window_Dynamsoft.DDV.DocumentDetect
{
  constructor(t) {
    super();
    C(this, "documentScanner");
    this.documentScanner = t;
  }
  async detect(t, config) {
    const location = [];
    try {
      let a = t.width;
      let i = t.height;
      let h = 1;
      let f;
      const s = 720;
      if (i > s) {
        h = i / s;
        i = s;
        a = Math.floor(a / h);
        f = this.compress(t.data, t.width, t.height, a, i);
      } else {
        f = t.data.slice(0);
      }
      v.width = a;
      v.height = i;
      const r = v.getContext("2d");
      if (r) {
        const y = r.createImageData(a, i);
        const e = y.data;
        const d = f;
        const l = new Uint8Array(d);
        e.set(l);
        r.putImageData(y, 0, 0);
        this.documentScanner.detect(v).forEach((w) => {
          location.push([w.x * h, w.y * h]);
        });
      }
    } catch (error) {
      console.log(error);
      location.push([0, 0]);
      location.push([0, 0]);
      location.push([0, 0]);
      location.push([0, 0]);
    }
    const u = {
      location,
      width: t.width,
      height: t.height,
      config,
    };
    const m = this.processDetectResult(u);
    return Promise.resolve(m);
  }
  compress(t, n, o, e, d) {
    let l = null;
    try {
      l = new Uint8ClampedArray(t);
    } catch {
      l = new Uint8Array(t);
    }
    const u = e / n;
    const m = d / o;
    const a = e * d * 4;
    const i = new ArrayBuffer(a);
    let h = null;
    try {
      h = new Uint8ClampedArray(i, 0, a);
    } catch {
      h = new Uint8Array(i, 0, a);
    }
    const f = (s, r) => {
      const y = Math.min(n - 1, s / u);
      const D = Math.min(o - 1, r / m);
      const w = Math.floor(y);
      const S = Math.floor(D);
      let A = r * e + s;
      let M = S * n + w;
      A *= 4;
      M *= 4;
      for (let R = 0; R <= 3; R += 1) {
        h[A + R] = l[M + R];
      }
    };
    for (let s = 0; s < e; s += 1) {
      for (let r = 0; r < d; r += 1) {
        f(s, r);
      }
    }
    return h;
  }
}
