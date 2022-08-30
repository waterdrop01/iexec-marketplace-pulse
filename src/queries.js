import { gql } from '@apollo/client';

export const getTVL = gql`
  query GetTVL {
    protocol(id: "iExec") {
      id
      tvl
    }
  }
`;

export const getDeals = gql`
  query GetDeals($timestamp: BigInt!, $skip: Int!, $first: Int!) {
    deals(
      skip: $skip
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { timestamp_lt: $timestamp }
    ) {
      id
      timestamp
      requester {
        id
      }
      app {
        id
        name
      }
      appPrice
      datasetPrice
      workerpoolPrice
      dataset {
        id
      }
      params
      completedTasksCount
      tasks {
        status
        timestamp
        events {
          timestamp
        }
      }
    }
  }
`;
