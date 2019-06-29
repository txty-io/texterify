function sortStrings(a: string, b: string, ignoreCase: boolean) {
  if (a === null && b === null) {
    return 0;
  } else if (a === null) {
    return -1;
  } else if (b === null) {
    return 1;
  }

  let nameA = a;
  let nameB = b;

  if (ignoreCase) {
    nameA = nameA.toUpperCase();
    nameB = nameB.toUpperCase();
  }

  if (nameA < nameB) {
    return -1;
  }

  if (nameA > nameB) {
    return 1;
  }

  return 0;
}

export {
  sortStrings
};
