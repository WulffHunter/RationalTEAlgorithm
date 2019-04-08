const csv = require('csvtojson')
const { createObjectCsvWriter: createCsvWriter } = require('csv-writer')
const { treadmillAlgorithm } = require('./treadmill.js')
const mkdirp = require('mkdirp')

const csvPath = process.argv[2] || './digit_span.csv'

const headerStandard = [
  { id: 'key', title: 'KEY' },
  { id: 'response', title: 'RESPONSE' },
  { id: 'score', title: 'SCORE' },
  { id: 'bestString', title: 'BEST_PERMUTATION' },
]

const headerAverage = [
  { id: 'score', title: 'AVERAGE_SCORE' },
]

const getCsvWriters = (participants) => {
  return {
    standard: createCsvWriter({
      path: `./output/${participants}_participants_standard.csv`,
      header: headerStandard,
    }),
    average: createCsvWriter({
      path: `./output/${participants}_participants_average.csv`,
      header: headerAverage,
    }),
  }
}

const csvWriters = {
  all: getCsvWriters('all'),
  mono: getCsvWriters('mono'),
  bi: getCsvWriters('bi'),
}

/*
	JSON object structure:
	[
		{
			Response: '3298674',
			Key: '3247608',
			BIL_EXPOSURE_BEFORE_5: 'YES'
		},
		...
	]
*/

//In order to not confuse the data when a zero appears, we'll convert both keys and values to strings

function analyseAllBlocks(results, isBilingual) {
  const bilString = (isBilingual === undefined)
    ? ''
    : isBilingual
      ? 'YES'
      : 'NO'

  return results
    .reduce((agg, { Response, Key, BIL_EXPOSURE_BEFORE_5 }) => {
      if (
        bilString !== '' && BIL_EXPOSURE_BEFORE_5.trim() !== bilString
      ) {
        return agg
      }

      const { score, bestString } = treadmillAlgorithm(Response + '', Key + '')

      return [
        ...agg,
        {
          response: Response,
          key: Key,
          score,
          bestString,
        },
      ]
    }, [])
}

/*
  For this one, each key of `results` will look like
  [
    {
      key: '1421',
      response: '1241',
      score: 3,
      bestString: '1241',
    },
    ...,
  ]
*/

const GROUP_BY = 5

function getBlockAverage(results) {
  const averages = []

  // For every block of `GROUP_BY`
  for (let i = 0; i < results.length; i += GROUP_BY) {
    // Set the initial score of the block to 0
    let blockScore = 0
    // Add each element in the block's score to the block score
    for (let j = 0; j < GROUP_BY; j++) {
      if (results[i + j] !== undefined) {
        blockScore += results[i + j].score
      }
    }
    // Push the average score of this block to the list
    averages.push({ score: (blockScore / GROUP_BY) })
  }

  return averages
}

//First create a directory to insert the files
mkdirp('./output', (err) => {
  // If there's an error with the directory's existence, throw
  if (err) {
    console.error(err)
    return
  }

  // Else, create the files
  csv()
    .fromFile(csvPath)
    .then((results) => {
      Promise.all([
        csvWriters.all.standard.writeRecords(analyseAllBlocks(results)),
        csvWriters.all.average.writeRecords(getBlockAverage(analyseAllBlocks(results))),
        
        csvWriters.mono.standard.writeRecords(analyseAllBlocks(results, false)),
        csvWriters.mono.average.writeRecords(getBlockAverage(analyseAllBlocks(results, false))),

        csvWriters.bi.standard.writeRecords(analyseAllBlocks(results, true)),
        csvWriters.bi.average.writeRecords(getBlockAverage(analyseAllBlocks(results, true))),
      ]).then(() => {
        console.log("Complete")
      })
    })
})
