var p = Object.defineProperty;
var E = (x, c, t) => c in x ? p(x, c, { enumerable: !0, configurable: !0, writable: !0, value: t }) : x[c] = t;
var C = (x, c, t) => (E(x, typeof c != "symbol" ? c + "" : c, t), t);
class _ {
  constructor() {
    C(this, "cv");
    if ("cv" in window)
      this.cv = window.cv;
    else
      throw new Error("OpenCV not found");
  }
  detect(c) {
    let t = this.cv;
    const n = t.imread(c), o = new t.Mat();
    t.cvtColor(n, o, t.COLOR_RGBA2GRAY);
    const e = new t.Mat();
    t.GaussianBlur(o, e, new t.Size(5, 5), 0, 0, t.BORDER_DEFAULT);
    const d = new t.Mat();
    t.threshold(e, d, 0, 255, t.THRESH_BINARY + t.THRESH_OTSU);
    let l = new t.MatVector(), u = new t.Mat();
    t.findContours(
      d,
      l,
      u,
      t.RETR_CCOMP,
      t.CHAIN_APPROX_SIMPLE
    );
    let m = 0, a = -1;
    for (let f = 0; f < l.size(); ++f) {
      let s = t.contourArea(l.get(f));
      s > m && (m = s, a = f);
    }
    const i = l.get(a), h = this.getCornerPoints(i);
    return n.delete(), o.delete(), e.delete(), d.delete(), l.delete(), u.delete(), h;
  }
  crop(c, t, n, o) {
    const e = this.cv, d = document.createElement("canvas"), l = e.imread(c);
    t || (t = this.detect(c));
    let u = new e.Mat();
    n || (n = Math.max(this.distance(t[0], t[1]), this.distance(t[2], t[3]))), o || (o = Math.max(this.distance(t[0], t[3]), this.distance(t[1], t[2])));
    let m = new e.Size(n, o), a = e.matFromArray(4, 1, e.CV_32FC2, [
      t[0].x,
      t[0].y,
      t[1].x,
      t[1].y,
      t[3].x,
      t[3].y,
      t[2].x,
      t[2].y
    ]), i = e.matFromArray(4, 1, e.CV_32FC2, [
      0,
      0,
      n,
      0,
      0,
      o,
      n,
      o
    ]), h = e.getPerspectiveTransform(a, i);
    return e.warpPerspective(
      l,
      u,
      h,
      m,
      e.INTER_LINEAR,
      e.BORDER_CONSTANT,
      new e.Scalar()
    ), e.imshow(d, u), l.delete(), u.delete(), d;
  }
  distance(c, t) {
    return Math.hypot(c.x - t.x, c.y - t.y);
  }
  getCornerPoints(c) {
    let t = this.cv, n = [];
    const e = t.minAreaRect(c).center;
    let d, l = 0, u, m = 0, a, i = 0, h, f = 0;
    for (let s = 0; s < c.data32S.length; s += 2) {
      const r = { x: c.data32S[s], y: c.data32S[s + 1] }, y = this.distance(r, e);
      r.x < e.x && r.y < e.y ? y > l && (d = r, l = y) : r.x > e.x && r.y < e.y ? y > m && (u = r, m = y) : r.x < e.x && r.y > e.y ? y > i && (a = r, i = y) : r.x > e.x && r.y > e.y && y > f && (h = r, f = y);
    }
    return n.push(d), n.push(u), n.push(h), n.push(a), n;
  }
}
const P = window.Dynamsoft, v = document.createElement("canvas");
class I extends P.DDV.DocumentDetect {
  constructor(t) {
    super();
    C(this, "documentScanner");
    this.documentScanner = t;
  }
  // Rewrite the detect method
  async detect(t, n) {
    const o = [];
    try {
      let a = t.width, i = t.height, h = 1, f;
      const s = 720;
      i > s ? (h = i / s, i = s, a = Math.floor(a / h), f = this.compress(t.data, t.width, t.height, a, i)) : f = t.data.slice(0), v.width = a, v.height = i;
      const r = v.getContext("2d");
      if (r) {
        const y = r.createImageData(a, i);
        var e = y.data, d = f, l = new Uint8Array(d);
        e.set(l), r.putImageData(y, 0, 0), this.documentScanner.detect(v).forEach((w) => {
          o.push([w.x * h, w.y * h]);
        });
      }
    } catch (a) {
      console.log(a), o.push([0, 0]), o.push([0, 0]), o.push([0, 0]), o.push([0, 0]);
    }
    const u = {
      location: o,
      width: t.width,
      height: t.height,
      config: n
    }, m = this.processDetectResult(u);
    return Promise.resolve(m);
  }
  compress(t, n, o, e, d) {
    let l = null;
    try {
      l = new Uint8ClampedArray(t);
    } catch {
      l = new Uint8Array(t);
    }
    const u = e / n, m = d / o, a = e * d * 4, i = new ArrayBuffer(a);
    let h = null;
    try {
      h = new Uint8ClampedArray(i, 0, a);
    } catch {
      h = new Uint8Array(i, 0, a);
    }
    const f = (s, r) => {
      const y = Math.min(n - 1, s / u), D = Math.min(o - 1, r / m), w = Math.floor(y), S = Math.floor(D);
      let A = r * e + s, M = S * n + w;
      A *= 4, M *= 4;
      for (let R = 0; R <= 3; R += 1)
        h[A + R] = l[M + R];
    };
    for (let s = 0; s < e; s += 1)
      for (let r = 0; r < d; r += 1)
        f(s, r);
    return h;
  }
}
export {
  _ as DocumentScanner,
  I as OpenCVDocumentDetectHandler
};
