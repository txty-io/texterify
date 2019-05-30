const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => {
        return hasCanceled_ ? reject({ isCanceled: true }) : resolve(val);
      },
      (error) => {
        return hasCanceled_ ? reject({ isCanceled: true }) : reject(error);
      }
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    }
  };
};

export { makeCancelable };
