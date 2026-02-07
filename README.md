# Viora Next

A modern social media platform frontend built with Next.js 15, React 19, and TypeScript.

**Repository:** <a href="https://github.com/Janadasroor/viora-web" target="_blank" rel="noopener noreferrer">https://github.com/Janadasroor/viora-web</a>

## Overview

Viora Next is the client-side application for the Viora social platform. It provides a rich, interactive user experience for sharing posts, reels, stories, and connecting with other users in real-time.

## Architecture

### State Management
- **React Context API**: Global state (auth, theme, socket)
- **Local State**: Component-level state with `useState`
- **Server State**: Fetched via API client with proper caching

### API Communication
- Custom `fetchClient` wrapper with:
  - Automatic token refresh
  - Error handling
  - Request/response interceptors
  - Cookie-based authentication

### Routing
- Next.js App Router (file-based routing)
- Protected routes via middleware
- Dynamic routes for user profiles and posts

### Real-time Features
- Socket.IO for live notifications
- Real-time message updates
- Online status tracking

## Development

### Code Organization
- **Components**: Organized by feature/domain
- **API Layer**: Separated from UI logic
- **Type Safety**: Full TypeScript coverage
- **Reusability**: Shared components in `common/`

### Best Practices
- Component composition over inheritance
- Custom hooks for reusable logic
- Proper error boundaries
- Optimistic UI updates
- Lazy loading for performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- **Backend API**: <a href="https://github.com/Janadasroor/viora-api" target="_blank" rel="noopener noreferrer">viora-api</a>
- **AI Recommender**: <a href="https://github.com/Janadasroor/viora-ai" target="_blank" rel="noopener noreferrer">viora-ai</a>

## License

This project is open source and available under the <a href="LICENSE" target="_blank">Apache License 2.0</a>.
