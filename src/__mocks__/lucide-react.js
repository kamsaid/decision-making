// Mock for lucide-react icons to avoid ESM issues in Jest tests
import React from 'react'

// Create a mock component for all icons
const createMockIcon = (name) => {
  const MockIcon = React.forwardRef((props, ref) => {
    return React.createElement('svg', {
      ...props,
      ref,
      'data-testid': `${name}-icon`,
      'aria-label': name,
    })
  })
  MockIcon.displayName = name
  return MockIcon
}

// Export all the icons used in the application
export const Pencil = createMockIcon('Pencil')
export const Target = createMockIcon('Target')
export const Heart = createMockIcon('Heart')
export const AlertCircle = createMockIcon('AlertCircle')
export const ThumbsUp = createMockIcon('ThumbsUp')
export const ThumbsDown = createMockIcon('ThumbsDown')
export const User = createMockIcon('User')
export const Bot = createMockIcon('Bot')
export const MessageCircle = createMockIcon('MessageCircle')
export const Menu = createMockIcon('Menu')
export const X = createMockIcon('X')
export const ChevronRight = createMockIcon('ChevronRight')
export const Home = createMockIcon('Home')
export const Send = createMockIcon('Send')
export const Loader2 = createMockIcon('Loader2')
export const ArrowRight = createMockIcon('ArrowRight')
export const CheckCircle = createMockIcon('CheckCircle')
export const XCircle = createMockIcon('XCircle')
export const Info = createMockIcon('Info')
export const Sparkles = createMockIcon('Sparkles')
export const Brain = createMockIcon('Brain')
export const Zap = createMockIcon('Zap')
export const Shield = createMockIcon('Shield')
export const Clock = createMockIcon('Clock')
export const TrendingUp = createMockIcon('TrendingUp')
export const Users = createMockIcon('Users')
export const DollarSign = createMockIcon('DollarSign')
export const MapPin = createMockIcon('MapPin')
export const Calendar = createMockIcon('Calendar')
export const Star = createMockIcon('Star')
export const Award = createMockIcon('Award')
export const Briefcase = createMockIcon('Briefcase')
export const Coffee = createMockIcon('Coffee')
export const Globe = createMockIcon('Globe')
export const Lightbulb = createMockIcon('Lightbulb')
export const Lock = createMockIcon('Lock')
export const Unlock = createMockIcon('Unlock')
export const Settings = createMockIcon('Settings')
export const Trash = createMockIcon('Trash')
export const Upload = createMockIcon('Upload')
export const Download = createMockIcon('Download')
export const RefreshCw = createMockIcon('RefreshCw')
export const Plus = createMockIcon('Plus')
export const Minus = createMockIcon('Minus')
export const Check = createMockIcon('Check')
export const Copy = createMockIcon('Copy')
export const ExternalLink = createMockIcon('ExternalLink')
export const Eye = createMockIcon('Eye')
export const EyeOff = createMockIcon('EyeOff')
export const Filter = createMockIcon('Filter')
export const Search = createMockIcon('Search')
export const Moon = createMockIcon('Moon')
export const Sun = createMockIcon('Sun')
// Add any other icons used in your components 