function getIndexRecursive(responseChar, startIndex, distance, increment, testString) {
  // console.log(responseChar, startIndex, distance, testString)
  if (testString[startIndex + distance] === undefined) {
    // If we're outside of the string, return -1
    return -1
  } else if (testString[startIndex + distance] === responseChar) {
    // If the current element is what we're looking for, return the
    // distance of the current element from the start
    return Math.abs(distance)
  } else {
    // Get the next best value in the given direction
    return getIndexRecursive(
      responseChar,
      startIndex,
      distance + increment,
      increment,
      testString,
    )
  }
}

function getValue(responseChar, currentIndex, testString) {
  // Get the values to the left and right
  const left = getIndexRecursive(responseChar, currentIndex, 0, -1, testString)
  const right = getIndexRecursive(responseChar, currentIndex, 0, 1, testString)
  // If the value of either is -1, return its opposite
  if (left === -1) {
    return right
  }
  if (right === -1) {
    return left
  }
  // Else, if neither are -1, find the minimum value (greedy search)
  return Math.min(left, right)
}

// Gets the score of a character in a string as a fraction
function getCharScore(responseChar, currentIndex, testString) {
  const value = getValue(responseChar, currentIndex, testString)
  return (
    // If the value found was -1, return 0 to prevent an infinite
    // fraction
    value === -1
      ? 0
      // Else, return the fraction
      : (1 / (value + 1))
  )
}

function getBasicStringScore(responseString, testString) {
  let score = 0
  for (let i = 0; i < responseString.length; i++) {
    // For each character, get its score and add it to the tally
    score += getCharScore(responseString[i], i, testString)
  }
  return score
}

// A utility function that lets us insert into a string
function stringInsert(inputString, index, insertion) {
  const stringToArray = [ ...inputString ]
  stringToArray.splice(index, 0, insertion)
  return stringToArray.join('')
}

function treadmill(inputString) {
  const computedStrings = []
  for (let i = 0; i <= inputString.length; i++) {
    // Push a string with a space at every point
    computedStrings.push(stringInsert(inputString, i, ' '))
  }
  return computedStrings
}

// A utility function to get only the first instance of a string
function unique(arrayOfStrings) {
  const uniqueElements = {}
  arrayOfStrings.forEach(element => {
    uniqueElements[element] = true
  })
  return Object.keys(uniqueElements)
}

function treadmillToLength(inputString, toLength) {
  // So far the only permutation is the original string
  let permutations = [ inputString ]

  // Run this operation until every string is the length we want
  // it to be
  for (let i = 0; i < (toLength - inputString.length); i++) {

    // For each unique permutation
    permutations = unique(permutations)
      .reduce((perms, stringToTreadmill) => {
        // If the permutation is the length we're currently extending
        if (stringToTreadmill.length === (inputString.length + i)) {
          // Add the results of treadmilling it to the string
          return [ ...perms, ...treadmill(stringToTreadmill) ]
        }
        // If it wasn't the length we're currently extending, skip it
        return perms
      }, [])
  }

  // Return the individual permutations without repetitions
  return unique(permutations)
}

module.exports.treadmillAlgorithm = function (responseString, testString) {
  const responseLength = responseString.length
  const testLength = testString.length

  if (responseLength === testLength) {
    return {
      score: getBasicStringScore(responseString, testString),
      bestString: responseString
    }
  }

  // For deletions
  if (responseLength < testLength) {
    let maxScore = 0
    let bestString = responseString
    // Get all the possible permutations where the response is as
    // long as the test string
    const permutations = treadmillToLength(responseString, testLength)

    permutations.forEach(permutation => {
      // Get the score for the current permutation
      const score = getBasicStringScore(permutation, testString)
      // If the score for the current permutation is greater than the
      // current max score, use the current perm's score
      if (score > maxScore) {
        bestString = permutation
        maxScore = score
      }
    })

    return { score: maxScore, bestString }
  }

  // For insertions
  if (responseLength > testLength) {
    let maxScore = 0
    let bestString = responseString
    // Get all the possible permutations where the response is as
    // long as the test string
    const permutations = treadmillToLength(testString, responseLength)

    permutations.forEach(permutation => {
      // Get the score for the current permutation
      const score = getBasicStringScore(responseString, permutation)
      // If the score for the current permutation is greater than the
      // current max score, use the current perm's score
      if (score > maxScore) {
        bestString = permutation
        maxScore = score
      }
    })

    return { score: maxScore, bestString }
  }

  // There's no way we'll get down here, but if we do
  console.log("Something went wrong", responseString, testString)
  return { score: 0, bestString: responseString }
}
