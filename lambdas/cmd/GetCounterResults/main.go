package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"net/http"
	"nikolai/pkg/counter"
	"nikolai/pkg/utils"
)

func handler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	id := req.PathParameters["id"]
	fmt.Printf("Getting results for %s", id)

	record := counter.Record{Id: id}
	record.FetchValues()

	return utils.ApiResponse(http.StatusOK, record)
}

func main() {
	lambda.Start(handler)
}
