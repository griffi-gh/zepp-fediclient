import { genTraceId, MessagePayloadType } from "../lib/zepp/message.js"
import { Deferred, timeout } from '../lib/zepp/defer.js'

export default function requestBin(m, data, opts) {
  const _request = () => {
    const defaultOpts = { timeout: 60000 }
    const requestId = genTraceId()
    const defer = Deferred()
    opts = Object.assign(defaultOpts, opts)

    const error = (error) => {
      m.off('error', error)
      defer.reject(error)
    }

    const transact = ({ traceId, payload }) => {
      // logger.debug('traceId=>%d payload=>%s', traceId, payload.toString('hex'))
      if (traceId === requestId) {
        //const resultJson = m.buf2Json(payload)
        // logger.debug('request id=>%d payload=>%j', requestId, data)
        // logger.debug('response id=>%d payload=>%j', requestId, resultJson)

        m.off('response', transact)
        m.off('error', error)
        defer.resolve(payload)
      }
    }

    m.on('response', transact)
    m.on('error', error)
    m.sendJson({ requestId, json: data, type: MessagePayloadType.Request })

    let hasReturned = false

    return Promise.race([
      timeout(opts.timeout, (resolve, reject) => {
        if (hasReturned) {
          return resolve()
        }

        // logger.error(`request timeout in ${opts.timeout}ms error=> %d data=> %j`, requestId, data)
        m.off('response', transact)

        reject(Error(`Timed out in ${opts.timeout}ms.`))
      }),
      defer.promise.finally(() => {
        hasReturned = true
      }),
    ])
  }

  return m.waitingShakePromise.then(_request)
}
