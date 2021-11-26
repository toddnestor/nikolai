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
  SliderFilledTrack,
} from "@chakra-ui/react";
import './App.css';

type CountResult = {
  goal: number;
  duration: string;
}

const MAX = 50_000_000_000;

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = 30 * DAY;
const YEAR = DAY * 365;

const pluralize = (count: number, word: string) => `${word}${Math.round(count) === 1 ? '' : 's'}`;

type TimePeriod = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

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
  return [`${Math.round(numIntervals).toLocaleString()} ${pluralize(numIntervals, word)}`, remainder];
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
  const [goal, setGoal] = React.useState(1_000_000_000);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<CountResult | null>(null);

  const loadIt = async () => {
    setLoading(true);
    const response = await fetch('https://api.nestopia.life/v1/count',{
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({goal})
    });

    setResults(await response.json());
    setLoading(false);
  };

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
        </VStack>
      </Box>
    </div>
  );
}

export default App;
