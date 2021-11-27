package main

import (
	"encoding/json"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/google/uuid"
	"net/http"
	"nikolai/pkg/counter"
	"nikolai/pkg/utils"
)

func handler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	var record counter.Record
	if err := json.Unmarshal([]byte(req.Body), &record); err != nil {
		return nil, errors.New("something went wrong")
	}

	record.Id = uuid.NewString()
	record.Count()
	record.Save()

	return utils.ApiResponse(http.StatusOK, record)
}

func main() {
	lambda.Start(handler)
}
