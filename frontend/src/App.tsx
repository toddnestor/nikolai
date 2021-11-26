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
      <header className="App-header">
        <VStack minWidth="350px">
          <h1>Nikolai's Counter</h1>
          <Box width="100%">
            <NumberInput max={MAX} colorScheme="white" type="number" value={goal} onChange={(value) => setGoal(parseInt(value))}>
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
        </VStack>
      </header>
    </div>
  );
}

export default App;
