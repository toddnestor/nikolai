package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"nikolai/pkg/counter"
)

func handler(req events.DynamoDBEvent) {
	for _, item := range req.Records {
		changes := item.Change.NewImage
		id := changes["Id"].String()

		if changes["completed"].Boolean() {
			fmt.Printf("Record %s has already been counted, skipping.", id)
			continue
		}

		record := new(counter.Record)

		record.Id = id
		goal, _ := changes["goal"].Integer()
		record.Goal = int(goal)
		record.Count()
		record.Save()
	}
}

func main() {
	lambda.Start(handler)
}
