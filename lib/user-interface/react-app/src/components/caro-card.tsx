import React from "react";
import Card from 'react-bootstrap/Card';
import { CardBody } from "react-bootstrap";
import Button from 'react-bootstrap/Button';

export interface ChatBotTaskCard {
  name: string;
  cardTitle: string;
  taskDescription: string;
  instructions: string;
  url: string;
  apiPrompt: string;
}

export function TaskCard(props: ChatBotTaskCard) {
  return (
    <div>
      <Card bg="info">
        <Card.Header></Card.Header>
        <CardBody>
          <Card.Title>{props.cardTitle}</Card.Title>
          <Card.Text>{props.taskDescription}</Card.Text>
          <Button variant="primary" href={props.url}>Try it</Button>
        </CardBody>
      </Card>
    </div>
  );
}
