let options = {}
let entries = []

const levels = {
	"debug": 0
	, "info": 1
	, "warn": 2
	, "error": 3
}

export const init = opts => {
	const defaultOptions = {
		pushUrl: "http://cors.home.lan/http://loki.home.lan/api/prom/push"
		, labels: "{env=\"development\", app=\"rounding-frontend\"}"
		, flushInterval: 10000
		, pushLevel: "debug"
	}

	options = { ...defaultOptions, ...opts }


	if (!window.prompushInterval) {
		window.prompushInterval = setInterval(async () => await flush(), options.flushInterval)
	}
}

export const debug = line => {
	line = `Debug: ${line}`

	if (levels[options.pushLevel] >= levels["debug"]) {
		push(line)
	}

	return line
}

export const info = line => {
	line = `Info: ${line}`

	if (levels[options.pushLevel] >= levels["info"]) {
		push(line)
	}

	return line
}

export const warn = line => {
	line = `Warn: ${line}`

	if (levels[options.pushLevel] >= levels["warn"]) {
		push(line)
	}

	return line
}

export const error = line => {
	line = `Error: ${line}`

	if (levels[options.pushLevel] >= levels["error"]) {
		push(line)
	}

	return line
}

const push = line => {
	entries.push({ line, ts: (new Date()).toISOString() })
}

const flush = async () => {
	if (!entries.length) {
		return
	}

	const { pushUrl, labels } = options

	const data = {
		streams: [
			{
				labels
				, entries: [...entries]
			}
		]
	}

	entries = []

	let xhr = new XMLHttpRequest()

	xhr.open("POST", pushUrl)
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(JSON.stringify(data))

	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4) {
			if (xhr.status != 204) {
				console.error(xhr.responseText)
			}
		}
	}
}
