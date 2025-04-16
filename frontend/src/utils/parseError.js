export const parseError = (error) => {
    if (error.response?.data) {
      const data = error.response.data
  
      if (typeof data === 'string') return data
  
      if (typeof data === 'object') {
        return Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ')
      }
    }
  
    // Fallback
    return error.message || "An unexpected error occurred."
  }
  