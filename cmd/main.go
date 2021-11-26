package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"net/http"
	"time"
)

type Counter struct {
	Goal int `json:"goal"`
}

type CountResponse struct {
	*Counter
	Duration string `json:"duration"`
}

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

	fmt.Println(str)

	return str
}

func apiResponse(status int, body interface{}) (*events.APIGatewayProxyResponse, error) {
	resp := events.APIGatewayProxyResponse{Headers: map[string]string{"Content-Type": "application/json"}}
	resp.StatusCode = status

	stringBody, _ := json.Marshal(body)
	resp.Body = string(stringBody)
	return &resp, nil
}

func handler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
  var counter Counter
	if err := json.Unmarshal([]byte(req.Body), &counter); err != nil {
		return nil, errors.New("Something went wrong")
	}

	duration := countIt(counter.Goal)
	response := CountResponse{
		Counter:  &counter,
		Duration: duration,
	}

	return apiResponse(http.StatusOK, response)
}

func main() {
	lambda.Start(handler)
}