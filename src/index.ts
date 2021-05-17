// https://danlevy.net/you-may-not-need-axios

import fetch from 'cross-fetch'

const error = ( code, message ) => {
	return { code, status: code, error: true, ok: false, message }
}
const success = ( data ) => {
	return { code: 200, status: 200, error: false, ok: true, data }
}

const rest = async ( method, url, args, silent ) => {

	if ( Array.isArray(url) ) url = url.join('/')

	try {

		let config = {}

		if ( method == 'delete' ) {
			config = {
				...config,
				credentials: 'include', // same-origin,
				method: method.toUpperCase()
			}
		}

		if ( method == 'get' && args ) {
			const keys = Object.keys( args )
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i]
				if (i == 0) url += '?'
				if ( args[key] != undefined && args[key] != '' ) {
					url += `${key}=${encodeURIComponent(args[key])}`
					if (i != keys.length - 1) url += '&'
				}
			}
			config = {
				...config,
				credentials: 'include', // same-origin,
				method: method.toUpperCase()
			}
		}

		if ( method == 'put' || method == 'post' ) {

			config = {
				...config,
				credentials: 'include', // same-origin,
				method: method.toUpperCase(),
				body: JSON.stringify( args || {} ),
				headers: { 'Content-Type': 'application/json' }
			}
		}
		
		if ( !silent ) console.log(`[fetcher] 🌟  ${url}`, config)

		const res = await fetch( url, config )
		let data = await res.text()
		try { data = JSON.parse( data ) } catch(err) { null }

		// @ts-expect-error: ...
		if ( !res.ok || data?.error ) console.log(`[fetcher] ❌  ${url}`, data.message, data.status, data.code)

		// @ts-expect-error: ...
		if ( !res.ok || data?.error ) return data

		if ( !silent ) console.log(`[fetcher] ✅  ${url}`)

		return success( data )

	} catch(err) {
		if ( !silent ) console.log(`[fetcher] ❌  ${url}`, err.message, err.status, err.code)
		return error( 500, err.message )
	}
}

const names = ['get','post','delete','put']
let out = {}

names.forEach( n => {
	out[n] = async( url, args, silent ) => {
		return await rest( n, url, args, silent )
	}
})

export default out

