// Analytics Dashboard Types

/**
 * @typedef {Object} KPIData
 * @property {string} label
 * @property {number | string} value
 * @property {number} change
 * @property {'up' | 'down' | 'stable'} trend
 * @property {string} [currency]
 * @property {'number' | 'currency' | 'percent'} [format]
 */

/**
 * @typedef {Object} ChartDataPoint
 * @property {string} date
 * @property {string} name
 * @property {number} value
 * @property {number} [value2]
 * @property {number} [value3]
 * @property {number} [percentage]
 * @property {string} [category]
 */

/**
 * @typedef {Object} RegionData
 * @property {string} id
 * @property {string} name
 * @property {number} revenue
 * @property {number} sales
 * @property {number} customers
 * @property {number} growth
 */

/**
 * @typedef {Object} CustomerData
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {number} totalSpent
 * @property {number} orders
 * @property {'active' | 'inactive' | 'at-risk'} status
 * @property {string} joinDate
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} ProductData
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} revenue
 * @property {number} units
 * @property {number} growth
 * @property {number} margin
 * @property {'high' | 'medium' | 'low'} status
 */

/**
 * @typedef {Object} SalesData
 * @property {string} id
 * @property {string} date
 * @property {string} customer
 * @property {string} product
 * @property {number} amount
 * @property {number} quantity
 * @property {string} region
 * @property {'completed' | 'pending' | 'failed'} status
 */

/**
 * @typedef {Object} ForecastData
 * @property {string} date
 * @property {number} actual
 * @property {number} predicted
 * @property {number} lower
 * @property {number} upper
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {string} role
 * @property {'online' | 'offline' | 'away'} status
 */

/**
 * @typedef {Object} DashboardConfig
 * @property {string[]} widgets
 * @property {'grid' | 'list'} layout
 * @property {number} refreshInterval
 */

/**
 * @typedef {Object} NavItem
 * @property {string} id
 * @property {string} label
 * @property {string} href
 * @property {string} icon
 * @property {number | string} [badge]
 * @property {NavItem[]} [children]
 */

/**
 * @typedef {Object} FilterOptions
 * @property {{from: Date, to: Date}} [dateRange]
 * @property {string[]} [categories]
 * @property {string[]} [regions]
 * @property {string[]} [status]
 * @property {string} [searchQuery]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} totalPages
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} id
 * @property {string} header
 * @property {string} accessor
 * @property {boolean} [sortable]
 * @property {string} [width]
 * @property {function(any, any): React.ReactNode} [render]
 */

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {'info' | 'warning' | 'error' | 'success'} type
 * @property {string} title
 * @property {string} message
 * @property {Date} timestamp
 * @property {boolean} read
 * @property {{label: string, href: string}} [action]
 */

/**
 * @typedef {Object} Analytics
 * @property {number} pageViews
 * @property {number} uniqueVisitors
 * @property {number} bounceRate
 * @property {number} averageSessionDuration
 * @property {number} conversionRate
 */

export {};
