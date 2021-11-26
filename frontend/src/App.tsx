import React from 'react';
import {
  NumberInput,
  Button,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  VStack,
  Box,
  Spinner,
  Stat,
  StatLabel,
  StatHelpText,
  StatNumber,
  StatGroup,
  SliderTrack,
  SliderThumb,
  Slider,
  SliderFilledTrack, AlertIcon, Alert,
} from "@chakra-ui/react";
import './App.css';

type CountResult = {
  Id: string;
  goal: number;
  duration: string;
  completed: boolean;
}

const MAX = 2_000_000_000_000;

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = 30 * DAY;
const YEAR = DAY * 365;

const pluralize = (count: number, word: string) => `${word}${Math.floor(count) === 1 ? '' : 's'}`;

type TimePeriod = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const TIME_PER_BILLION = 327;

const estimatedTimeRemaining = (goal: number, start: number) => {
  const elapsed = Date.now() - start;
  const billions = goal / 1_000_000_000;
  const estimate = billions * TIME_PER_BILLION;

  return Math.floor((estimate - elapsed) / 1000);
}

const INTERVALS: {[key: string]: number} = {
  second: SECOND,
  minute: MINUTE,
  hour: HOUR,
  day: DAY,
  week: WEEK,
  month: MONTH,
  year: YEAR,
};

const intervals = (difference: number, word: TimePeriod): [string, number] => {
  const numIntervals = difference / INTERVALS[word];
  const remainder = difference % INTERVALS[word];
  return [`${Math.floor(numIntervals).toLocaleString()} ${pluralize(numIntervals, word)}`, remainder];
};

const humanCountTime = (duration: number): string => {
  let word: (TimePeriod) = 'year';

  if (duration < MINUTE) {
    word = 'second';
  } else if (duration < HOUR) {
    word = 'minute';
  } else if (duration < DAY) {
    word = 'hour';
  } else if (duration < WEEK) {
    word = 'day';
  } else if (duration < WEEK * 10) {
    word = 'week';
  } else if (duration < YEAR) {
    word = 'month';
  }

  const [str, remainder] = intervals(duration, word);

  if (remainder === 0) {
    return str;
  }

  return [str, humanCountTime(remainder)].join(' ');
}

function App() {
  const [start, setStart] = React.useState<number | null>(null);
  const [goal, setGoal] = React.useState(1_000_000_000);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<CountResult | null>(null);
  const [error, setError] = React.useState(false);

  const loadIt = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('https://api.nestopia.life/v1/start-count', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({goal})
      });
      if (response.ok) {
        setStart(Date.now());
        setResults(await response.json());
      } else {
        setError(true);
      }
    } catch(e) {
      setError(true);
    }
  };

  React.useEffect(() => {
    if (!results) {
      return;
    }

    let interval: NodeJS.Timeout | undefined;

    const poller = async () => {
      const response = await fetch(`https://api.nestopia.life/v1/get-count/${results.Id}`);

      if (response.ok) {
        const json: CountResult = await response.json();

        setResults(json);

        if (json.completed && interval) {
          clearInterval(interval);
        }
      } else {
        setError(true);
      }
    };

    interval = setInterval(() => poller(), 1000);
  }, [results?.Id]);

  React.useEffect(() => {
    if (!results) {
      return;
    }

    if (results.completed) {
      setLoading(false);
    }
  }, [results?.completed]);

  return (
    <div className="App">
      <Box className="App-header" p={4}>
        <VStack minWidth="350px">
          <h1>Nikolai's Counter</h1>
          <Box width="100%">
            <NumberInput min={0} max={MAX} colorScheme="white" type="number" value={goal} onChange={(value) => setGoal(parseInt(value || '0'))}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          {
            error && (
              <Box>
                <Alert status="error" variant="solid">
                  <AlertIcon />
                  There was an error processing your request, please try a lower number
                </Alert>
              </Box>
            )
          }
          {
            (!results || !results.completed) && start && (
              <Box>
                <Alert status="info" variant="solid">
                  <AlertIcon />
                  There is an estimated {estimatedTimeRemaining(goal, start)} seconds remaining.
                </Alert>
              </Box>
            )
          }
          <Box width="100%">
            <Slider min={0} max={MAX} focusThumbOnChange={false} value={goal} onChange={value => setGoal(value)}>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb fontSize="sm" boxSize="32px" />
            </Slider>
          </Box>
          <Box width="100%">
            <Button variant="outline" onClick={loadIt}>Count to {goal.toLocaleString()}!</Button>
          </Box>
          <Box width="100%">
            {loading && <Spinner mt={4} size="xl"/>}
          </Box>
          {
            !loading && results && (
              <Box width="100%">
                <StatGroup>
                  <Stat>
                    <StatLabel>Goal</StatLabel>
                    <StatNumber>{results.goal.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      What we counted to
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Duration</StatLabel>
                    <StatNumber>{results.duration}</StatNumber>
                    <StatHelpText>
                      How long it took
                    </StatHelpText>
                  </Stat>
                </StatGroup>
              </Box>
            )
          }
          <Box maxWidth="600px" pt={8}>
            It would take a human
            <br/>
            <strong>{humanCountTime(goal || 0)}</strong>
            <br/>
            to count that high!
          </Box>
          <Box pt={4}><sup>*</sup> assuming on average they count one number per second</Box>
        </VStack>
      </Box>
    </div>
  );
}

export default App;
