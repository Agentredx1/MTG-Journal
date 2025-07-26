# Frontend-Backend Decoupling Checklist for MTG Journal

## Overview
This checklist outlines the steps required to decouple the current Flask monolith into a separate React.js frontend and Flask API backend, maintaining the group-based multi-tenancy architecture.

## Backend API Development

### 1. Authentication & Session Management
- [ ] **Convert session-based auth to JWT/token-based authentication**
  - Replace Flask sessions with JWT tokens for stateless API
  - Implement token generation and validation middleware
  - Store group context in JWT payload instead of session
  - Add token refresh mechanism

- [ ] **Create authentication endpoints**
  - `POST /api/auth/login` - Group passkey authentication
  - `POST /api/auth/logout` - Token invalidation
  - `POST /api/auth/refresh` - Token refresh
  - `GET /api/auth/verify` - Token validation

### 2. API Route Structure
- [ ] **Convert Flask routes to RESTful API endpoints**
  - `GET /api/groups/current` - Get current group info
  - `GET /api/stats/players` - Player statistics
  - `GET /api/stats/commanders` - Commander statistics  
  - `GET /api/stats/colors` - Color distribution stats
  - `GET /api/stats/streaks` - Win streak data
  - `GET /api/players` - All players in group
  - `GET /api/players/:name` - Individual player details
  - `POST /api/games` - Add new game
  - `GET /api/games` - Game history
  - `GET /api/commanders/suggestions` - Commander autocomplete

### 3. Data Serialization
- [ ] **Implement consistent JSON response format**
  - Standardize API response structure (data, status, message)
  - Add proper HTTP status codes
  - Implement error response formatting
  - Add pagination for list endpoints

- [ ] **Convert query functions for API use**
  - Modify `queries.py` functions to return JSON-serializable dictionaries
  - Remove tuple returns, use consistent dict format
  - Add proper error handling and validation
  - Maintain group filtering throughout

### 4. File Upload & CSV Processing
- [ ] **Convert CSV upload to API endpoint**
  - `POST /api/games/bulk-upload` - CSV file processing
  - Implement multipart/form-data handling
  - Return upload progress and validation results
  - Add file type and size validation

### 5. CORS & Security
- [ ] **Configure CORS for React frontend**
  - Install Flask-CORS
  - Configure allowed origins for development/production
  - Set up preflight request handling

- [ ] **Add API security middleware**
  - Request rate limiting
  - Input validation and sanitization
  - CSRF protection for state-changing operations
  - Secure headers configuration

## Frontend React Development

### 6. Project Setup
- [ ] **Initialize React project**
  - Create new React app with TypeScript
  - Set up routing with React Router
  - Configure build tools and environment variables
  - Install required dependencies (axios, react-query, etc.)

### 7. Authentication System
- [ ] **Implement token-based authentication**
  - Create authentication context/state management
  - Build login component with passkey input
  - Implement token storage (localStorage/sessionStorage)
  - Add authentication guards for protected routes
  - Handle token expiration and refresh

### 8. State Management
- [ ] **Set up global state management**
  - Choose state solution (Context API, Redux, Zustand)
  - Implement group context state
  - Add user authentication state
  - Create data fetching and caching strategy

### 9. Component Architecture
- [ ] **Create core layout components**
  - Navigation header with group display
  - Mobile-responsive hamburger menu
  - Footer component
  - Loading and error boundary components

- [ ] **Build feature components**
  - Homepage dashboard with top players and win streaks
  - Statistics page with player/commander/color stats
  - Player detail pages
  - Game entry form with dynamic player inputs
  - CSV upload component with progress tracking

### 10. API Integration
- [ ] **Create API client layer**
  - Set up axios instance with base configuration
  - Implement request/response interceptors for auth
  - Add error handling and retry logic
  - Create typed API functions for all endpoints

- [ ] **Data fetching and caching**
  - Implement React Query or SWR for data fetching
  - Add optimistic updates for mutations
  - Handle loading and error states
  - Implement real-time updates if needed

### 11. UI/UX Migration
- [ ] **Recreate existing designs**
  - Convert CSS to component-based styling (CSS modules/styled-components)
  - Ensure responsive design works across devices
  - Implement commander image galleries and modals
  - Add loading skeletons and progress indicators

- [ ] **Enhance user experience**
  - Add form validation with real-time feedback
  - Implement search and filtering capabilities
  - Add sorting options for statistics tables
  - Include keyboard navigation support

## Database & Asset Management

### 12. Static Assets
- [ ] **Set up asset serving strategy**
  - Move commander images to CDN or static file server
  - Update image URL generation in API responses
  - Implement lazy loading for commander images
  - Add image optimization and caching headers

### 13. Database Considerations
- [ ] **Review database performance**
  - Add database indexes for frequently queried fields
  - Consider connection pooling for production
  - Implement database migrations if schema changes needed
  - Add database backup strategy

## Deployment & DevOps

### 14. Development Environment
- [ ] **Set up development workflow**
  - Configure concurrent frontend/backend development
  - Set up proxy configuration for API calls
  - Add hot reloading for both environments
  - Create development database seeding scripts

### 15. Production Deployment
- [ ] **Prepare for production deployment**
  - Set up separate build processes for frontend/backend
  - Configure environment variables for both applications
  - Implement health check endpoints
  - Set up logging and monitoring
  - Plan deployment strategy (Docker, traditional hosting, etc.)

## Testing Strategy

### 16. Backend Testing
- [ ] **Add API testing**
  - Unit tests for query functions
  - Integration tests for API endpoints
  - Authentication and authorization testing
  - Group isolation testing

### 17. Frontend Testing
- [ ] **Implement frontend testing**
  - Unit tests for components and utilities
  - Integration tests for user flows
  - End-to-end testing with Cypress/Playwright
  - API mocking for isolated testing

## Migration Strategy

### 18. Gradual Migration Plan
- [ ] **Phase 1: API Development**
  - Build and test all API endpoints
  - Maintain existing Flask frontend temporarily
  - Validate API functionality with existing data

- [ ] **Phase 2: Frontend Development**
  - Build React frontend consuming the new API
  - Test thoroughly in development environment
  - Ensure feature parity with existing application

- [ ] **Phase 3: Deployment & Cutover**
  - Deploy both applications to production
  - Monitor performance and error rates
  - Remove old Flask templates and routes
  - Update documentation

## Validation Checklist

### 19. Feature Parity Verification
- [ ] **Core functionality preserved**
  - Group-based authentication and data isolation
  - Game entry with CSV upload support
  - Player and commander statistics
  - Win streak calculations
  - Color distribution analysis
  - Individual player profiles

- [ ] **Performance requirements met**
  - API response times acceptable
  - Frontend load times optimized
  - Database queries performing well
  - Image loading optimized

### 20. Quality Assurance
- [ ] **Cross-browser compatibility**
  - Test on major browsers (Chrome, Firefox, Safari, Edge)
  - Verify mobile responsiveness
  - Check accessibility compliance
  - Validate SEO considerations if applicable

---

## Notes
- Maintain backward compatibility during migration
- Consider implementing API versioning for future changes
- Document all API endpoints with OpenAPI/Swagger
- Plan for data migration if database schema changes required
- Consider implementing real-time features (WebSockets) for live game tracking