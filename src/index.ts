// import { lookup } from 'mime-types'

export default {
  async fetch(request, env): Promise<Response> {
    // this isn't working
    // should be fixed by https://community.cloudflare.com/t/content-encoding-working-on-http-but-not-https/87057
    // but I can't find that setting

    // const acceptEncoding = request.headers.get('Accept-Encoding') || ''
    // console.log('acceptEncoding', acceptEncoding)
    // const url = new URL(request.url)
    // if (url.pathname.includes('.') && /\bgzip\b/.test(acceptEncoding)) {
    //   const contentType = lookup(url.pathname)
    //   url.pathname = url.pathname + '.gz'
    //   const r = await env.ASSETS.fetch(url, request)
    //   console.log('contentType', contentType, r.status)
    //   if (r.status == 200) {
    //     return new Response(r.body, {
    //       headers: {
    //         'Content-Type': contentType || 'application/octet-stream',
    //         'Content-Encoding': 'gzip',
    //         'Access-Control-Allow-Origin': allowOrigin(request),
    //       },
    //     })
    //   }
    // }

    const r = await env.ASSETS.fetch(request)
    if (r.status == 404) {
      // default is empty, add some details
      return new Response('404: Page Not Found', {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin(request),
        }
      })
    } else {
      const headers = new Headers(r.headers)
      if (!headers.has('Access-Control-Allow-Origin')) {
        headers.set('Access-Control-Allow-Origin', allowOrigin(request))
      }
      return new Response(r.body, {
        status: r.status,
        headers,
      })
    }
  },
} satisfies ExportedHandler<Env>


function allowOrigin(request: Request): string {
  const origin = request.headers.get('Origin')
  if (origin && origin.startsWith('http://localhost:')) {
    // allow all localhost ports
    return origin
  } else if (origin && origin.endsWith('.pydantic.workers.dev')) {
    // allow all pydantic.workers.dev subdomains
    return origin
  } else {
    // otherwise do the simple thing and allow just https://pydantic.run
    return 'https://pydantic.run'
  }
}
