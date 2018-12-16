export default function mapEventListeners(listenersMap, cb) {
	if (cb) {
		listenersMap.forEach(args => cb(...args))
	}
}
