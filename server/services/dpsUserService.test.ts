import { CreateUserRequest, PrisonCaseload, PrisonStaffNewUser, PrisonUserDetails } from 'manageUsersApiClient'
import DpsUserService from './dpsUserService'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { CreateLinkedDpsUserRequest } from '../interfaces/createLinkedDpsUserRequest'

jest.mock('../data/manageUsersApiClient')

describe('DpsUserService', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: DpsUserService

  beforeEach(() => {
    apiClient = {
      createUser: jest.fn(),
      getCaseloads: jest.fn(),
      getDpsUser: jest.fn(),
      createLinkedCentralAdminUser: jest.fn(),
      createLinkedLsaUser: jest.fn(),
      createLinkedGeneralUser: jest.fn(),
    } as unknown as jest.Mocked<ManageUsersApiClient>

    service = new DpsUserService(apiClient)
  })

  const token = 'test-token'

  it('creates a DPS user', async () => {
    const request = { username: 'new-user' } as CreateUserRequest
    const response = { username: 'new-user' } as PrisonStaffNewUser

    apiClient.createUser.mockResolvedValue(response)

    const result = await service.createDpsUser(token, request)

    expect(apiClient.createUser).toHaveBeenCalledWith(token, request)
    expect(result).toBe(response)
  })

  it('gets caseloads', async () => {
    const caseloads: PrisonCaseload[] = [{ id: 'MDI', name: 'Moorland' }]

    apiClient.getCaseloads.mockResolvedValue(caseloads)

    const result = await service.getCaseloads(token)

    expect(apiClient.getCaseloads).toHaveBeenCalledWith(token)
    expect(result).toBe(caseloads)
  })

  it('gets a DPS user', async () => {
    const user: PrisonUserDetails = { username: 'some-user' } as PrisonUserDetails

    apiClient.getDpsUser.mockResolvedValue(user)

    const result = await service.getDpsUser(token, 'some-user')

    expect(apiClient.getDpsUser).toHaveBeenCalledWith(token, 'some-user')
    expect(result).toBe(user)
  })

  const createLinkedDpsUserRequest = (
    userType: string,
    existingUsername: string,
    username: string,
  ): CreateLinkedDpsUserRequest => {
    return {
      userType,
      existingUsername,
      username,
      createUser: '',
      searchUser: '',
      defaultCaseloadId: 'MDI',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@justice.gov.uk',
    }
  }

  it('creates a linked central admin user when userType = DPS_ADM', async () => {
    const request: CreateLinkedDpsUserRequest = createLinkedDpsUserRequest('DPS_ADM', 'existing-admin', 'new-admin')

    apiClient.createLinkedCentralAdminUser.mockResolvedValue({
      adminAccount: { username: 'new-admin' },
    })

    const result = await service.createLinkedDpsUser(token, request)

    expect(apiClient.createLinkedCentralAdminUser).toHaveBeenCalledWith(token, {
      existingUsername: 'existing-admin',
      adminUsername: 'new-admin',
    })

    expect(result).toBe('new-admin')
  })

  it('creates a linked LSA user when userType = DPS_LSA', async () => {
    const request = createLinkedDpsUserRequest('DPS_LSA', 'existing-lsa', 'new-lsa')

    apiClient.createLinkedLsaUser.mockResolvedValue({
      adminAccount: { username: 'new-lsa' },
    })

    const result = await service.createLinkedDpsUser(token, request)

    expect(apiClient.createLinkedLsaUser).toHaveBeenCalledWith(token, {
      existingUsername: 'existing-lsa',
      adminUsername: 'new-lsa',
      localAdminGroup: 'MDI',
    })

    expect(result).toBe('new-lsa')
  })

  it('creates a linked general user when userType = DPS_GEN', async () => {
    const request = createLinkedDpsUserRequest('DPS_GEN', 'existing-gen', 'new-gen')

    apiClient.createLinkedGeneralUser.mockResolvedValue({
      generalAccount: { username: 'new-gen' },
    })

    const result = await service.createLinkedDpsUser(token, request)

    expect(apiClient.createLinkedGeneralUser).toHaveBeenCalledWith(token, {
      existingAdminUsername: 'existing-gen',
      generalUsername: 'new-gen',
      defaultCaseloadId: 'MDI',
    })

    expect(result).toBe('new-gen')
  })
})
