# 🌀 Saihex Studios' WebP S3 API

**A tiny, nimble Deno-powered API** that connects to any S3-compatible storage and delivers **WebP conversions on the fly** — because modern formats deserve modern delivery.

---

## 💼 Why Saihex uses it (a tale for the busy)

This API was born out of **a single irritation**: Discord not playing nice with SVGs in embeds. So we built this to fix that. Drop in an SVG (or other supported formats), and get back a shiny WebP ready for the web. ✨

- **Perfect with [MinIO](https://min.io/)** (Community Edition)
- **SVG in, WebP out** — HRT be like 🏳️‍⚧️
- **Designed for simplicity**, for devs who don’t want a whole circus of config files just to get image conversion working

---

## 🚀 So, what does it actually do?

- Connects to an S3-compatible (or S3-like) API endpoint
- Accepts supported image file types
- Converts them to **WebP** on demand
- Returns the image as if it had always been that way — like magic, but with bytes

> 🧠 **Bonus fox-fact:**  
> This works even with **plain static file hosting** — as long as the server supports `HEAD` requests!  
> The API sends a `HEAD` request first to verify content-type and avoid downloading junk.  
> If the server doesn't respond to `HEAD` properly, this clever optimization becomes a **deoptimization**, and performance goes *poof*. 🪦

---

## 📎 Tiny Usage Docs (Because You Asked)

The API responds to **any path**, using the same logic every time.

You **must** provide a `src` header like:

```
src: public/hormone/estrogen.svg
```

That points to the path of the file in your S3 bucket (or static media host).

### 🔧 Configuration (via compose.yaml)

- `s3endpoint`: Set this to your S3-compatible URL (e.g. MinIO endpoint)
- `allowedPathRegex`: A regex pattern to limit what paths are accepted

> 🧠 **Example:**  
> Set `allowedPathRegex = ^public/.*` to only allow assets from the `public/` prefix.  
> Useful if your storage is internal and the API acts as a public-facing filter.

No magic, no middle-layer SDK wrappers — just raw fetches and direct WebP **transition— I mean, transformation...** Isn’t that the same thing...? 🏳️‍⚧️

---

## 🔒 PSA: No Authentication Built In

This API is built **only for accessing public assets**. That means:
- No token system
- No credentials
- No access keys
- No secrets

Just **publicly accessible S3/static URLs**, like a dumb fox fetching shiny things from the open.

> 🛠️ **Want auth?**  
> Clone it, fork it, bolt OAuth on, scream at Deno, and make it your own. We’re not your boss.

---

## 🧪 Documentation? Pfft.

Look, it does one thing and it does it well. If you're expecting a 40-page manual, this isn’t that kind of project.

But hey, **it’s MIT licensed**, so feel free to:
- Fork it
- Hack it
- Rewrite it in Rust or Go
- Or even feed it estrogen and let it become your own thing

Yes, we’re that generous.

---

## 🐾 In summary...

Fast, simple, effective — **like a caffeinated fox handling your image assets**.

Built by Saihex Studios for internal use, but shared with you because we're nice like that.  
**Meow~ 🦊**
