import ExampleApiClient from '../data/exampleApiClient'

export default class ExampleService {
  constructor(private readonly exampleApiClient: ExampleApiClient) {}

  getCurrentTime(token: string) {
    return this.exampleApiClient.getCurrentTime(token)
  }
}
