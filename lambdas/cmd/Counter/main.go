package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"nikolai/pkg/counter"
	"regexp"
	"time"
)

func countIt(goal int) string {
	count := 0

	fmt.Printf("We are starting to count to %d...\n", goal)

	start := time.Now()

	for count < goal {
		count = count + 1
	}

	fmt.Printf("We counted to: %d \n", count)

	duration := time.Since(start)

	str := fmt.Sprintf(
		"It took us: %s\n",
		duration,
	)

	regex := regexp.MustCompile(`\.\d+`)

	str = regex.ReplaceAllString(str, "")

	fmt.Println(str)

	return str
}

func handler(req events.DynamoDBEvent) {
	for _, item := range req.Records {
		record := new(counter.Record)
		changes := item.Change.NewImage

		record.Id = changes["Id"].String()
		goal, _ := changes["goal"].Integer()
		record.Goal = int(goal)
		record.Duration = countIt(record.Goal)
		record.Completed = true
		record.Save()
	}
}

func main() {
	lambda.Start(handler)
}
