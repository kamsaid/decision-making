// Mock for lucide-react icons to avoid ESM issues in Jest tests
const React = require('react')

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
module.exports = {
  Pencil: createMockIcon('Pencil'),
  Target: createMockIcon('Target'),
  Heart: createMockIcon('Heart'),
  AlertCircle: createMockIcon('AlertCircle'),
  ThumbsUp: createMockIcon('ThumbsUp'),
  ThumbsDown: createMockIcon('ThumbsDown'),
  User: createMockIcon('User'),
  Bot: createMockIcon('Bot'),
  MessageCircle: createMockIcon('MessageCircle'),
  Menu: createMockIcon('Menu'),
  X: createMockIcon('X'),
  ChevronRight: createMockIcon('ChevronRight'),
  Home: createMockIcon('Home'),
  Send: createMockIcon('Send'),
  Loader2: createMockIcon('Loader2'),
  ArrowRight: createMockIcon('ArrowRight'),
  CheckCircle: createMockIcon('CheckCircle'),
  XCircle: createMockIcon('XCircle'),
  Info: createMockIcon('Info'),
  Sparkles: createMockIcon('Sparkles'),
  Brain: createMockIcon('Brain'),
  Zap: createMockIcon('Zap'),
  Shield: createMockIcon('Shield'),
  Clock: createMockIcon('Clock'),
  TrendingUp: createMockIcon('TrendingUp'),
  Users: createMockIcon('Users'),
  DollarSign: createMockIcon('DollarSign'),
  MapPin: createMockIcon('MapPin'),
  Calendar: createMockIcon('Calendar'),
  Star: createMockIcon('Star'),
  Award: createMockIcon('Award'),
  Briefcase: createMockIcon('Briefcase'),
  Coffee: createMockIcon('Coffee'),
  Globe: createMockIcon('Globe'),
  Lightbulb: createMockIcon('Lightbulb'),
  Lock: createMockIcon('Lock'),
  Unlock: createMockIcon('Unlock'),
  Settings: createMockIcon('Settings'),
  Trash: createMockIcon('Trash'),
  Upload: createMockIcon('Upload'),
  Download: createMockIcon('Download'),
  RefreshCw: createMockIcon('RefreshCw'),
  Plus: createMockIcon('Plus'),
  Minus: createMockIcon('Minus'),
  Check: createMockIcon('Check'),
  Copy: createMockIcon('Copy'),
  ExternalLink: createMockIcon('ExternalLink'),
  Eye: createMockIcon('Eye'),
  EyeOff: createMockIcon('EyeOff'),
  Filter: createMockIcon('Filter'),
  Search: createMockIcon('Search'),
  Moon: createMockIcon('Moon'),
  Sun: createMockIcon('Sun'),
  // Add any other icons used in your components
} 