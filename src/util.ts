export const binarySearch = <T>(array: T[], compare: (item: T) => boolean) => {
  let index = -1
  let prev = -1
  let low = 0
  let high = array.length
  if (!high)
    return {
      item: null,
      index: 0,
    }

  let item
  let result
  do {
    prev = index
    index = low + ((high - low) >> 1)
    item = array[index]
    result = compare(item)

    if (result) low = index
    else high = index
  } while (prev !== index)

  if (item != null) {
    return {
      item: item,
      index: index,
    }
  }

  return {
    item: null,
    index: ~low * -1 - 1,
  }
}
