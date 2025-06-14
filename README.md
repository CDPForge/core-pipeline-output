# Core Pipeline Elasticsearch Indexer

Core CDP Forge Platform module responsible for log indexing in Elasticsearch.

## Overview

This project is designed to receive, process, and index logs into Elasticsearch. It provides a robust solution for log management and analysis through a batch indexing system with automatic error handling.

## Features

- Batch log indexing to Elasticsearch
- Automatic buffer management and periodic flush
- Elasticsearch authentication support
- Robust error handling with automatic retry
- Flexible batch parameter configuration

## Prerequisites

- Node.js (LTS version recommended)
- TypeScript
- Elasticsearch 7.x or higher

## Installation

```bash
npm install
```

```bash
npm run build
```

## Configuration

The module requires Elasticsearch configuration in the config file:

```yaml
esConfig:
  url: "http://localhost:35355"
  username: "elastic"
  password: "password"
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## Key Features

- **Batch Processing**: Logs are accumulated and sent in batches to optimize performance
- **Auto Flush**: Automatic flush of remaining logs after a configurable timeout
- **Error Handling**: In case of sending errors, logs are kept in the buffer for retry