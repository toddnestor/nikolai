# Nikolai's Counter

Nikolai was interested in counting to large numbers, and how fast a computer can count vs a human.

To demonstrate, we built a small program together that was a simple loop in Go:

```go
func main() {
	count := 0

	goal := 1_000_000_000_000

	start := time.Now()

	for count < goal {
		count = count + 1
	}

	fmt.Printf("We counted to: %d \n", count)

	duration := time.Since(start)

	fmt.Printf("It took us: %s", duration)
}
```

We saw that it could count to five trillion in about 20 min on my computer, whereas a human would take about 150,000 years to count that high if they never slept and counted one number per second.

He wanted to keep playing with it so we built the logic into lambdas and put it online.

There are four lambdas: StartCount, GetCountResults, Counter, RealTimeCounter

StartCount will initiate a count by putting a record in dynamo, the Counter lambda is subscribed to dynamo and will pick up the record and perform the count.

While we could just return an estimate of how long it would take to count, we wanted it to actually have to count, and so it does.

GetCountResults can be polled for the results of the counting.

RealTimeCounter will perform the count in real time, if the count should take about two seconds or less we use that endpoint.

We use API Gateway to handle the endpoints, and Dynamo is the database.

The frontend is a progressive web app written in React with TypeScript.

The site can be found at https://nikolai.nestopia.life

Here is the Architecture diagram:

![Nikolai's Counter drawio (1)](https://user-images.githubusercontent.com/6495028/143719016-2f4508f1-2385-4208-b5b5-88e123db883b.png)
