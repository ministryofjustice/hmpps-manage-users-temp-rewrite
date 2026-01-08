import config from '../config'

const isEnabled = (): boolean => config.featureSwitches.manageUserAllowList.enabled
const environmentLabel = (): string => config.featureSwitches.manageUserAllowList.environmentLabel

const helpers = {
  isEnabled,
  environmentLabel,
}

export default helpers
