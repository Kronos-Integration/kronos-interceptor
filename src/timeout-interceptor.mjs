import { Interceptor } from './interceptor';

import { mergeAttributes, createAttributes } from 'model-attributes';

/**
 * Rejects a request if it does not resolve in a given time
 */
export class TimeoutInterceptor extends Interceptor {
  static get configurationAttributes() {
    return mergeAttributes(
      createAttributes({
        timeout: {
          description: 'request timeout',
          default: 1,
          type: 'duration'
        }
      }),
      Interceptor.configurationAttributes
    );
  }

  /**
   * @return {string} 'timeout'
   */
  static get name() {
    return 'timeout';
  }

  receive(request) {
    return rejectUnlessResolvedWithin(
      this.connected.receive(request),
      this.timeout * 1000,
      this
    );
  }
}

/**
 * @param {Promise} promise
 * @param {number} timeout in miliseconds
 * @param {string} name
 * @return {Promise}
 */
function rejectUnlessResolvedWithin(promise, timeout, name) {
  if (timeout === 0) return promise;

  return new Promise((resolve, reject) => {
    const th = setTimeout(
      () =>
        reject(new Error(`${name} request not resolved within ${timeout}ms`)),
      timeout
    );

    return promise.then(
      reject => {
        clearTimeout(th);
        resolve(fullfilled);
      },
      err => {
        clearTimeout(th);
        reject(err);
      }
    );
  });
}