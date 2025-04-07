# SQLMonitor

<img src="app-icon.png" alt="SQLMonitor Logo" width="100" />

Monitor your application's health with automated SQL queries.

## Features

- **MySQL & PostgreSQL Support**: Connect to both database types from a single dashboard
- **Real-time Monitoring**: Track metrics as they happen with instant updates
- **Custom Queries**: Monitor any metric by writing your own SQL queries that run on a schedule
- **Growth Tracking**: Identify trends and patterns with beautiful, interactive charts
- **Secure by Design**: Your database credentials never leave your device
- **Lightweight**: Built with Rust and Tauri for exceptional performance and minimal resource usage

## Screenshots

![SQLMonitor Dashboard](path/to/screenshot.png)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)

### Download

Download the latest version for your platform from the [Releases](https://github.com/skyronic/sqlmonitor/releases) page.

## Development

```bash
# Clone the repository
git clone https://github.com/skyronic/sqlmonitor.git
cd sqlmonitor

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

## Building

```bash
# Build for production
pnpm tauri build
```

This will create platform-specific binaries in the `src-tauri/target/release` directory.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Rust with Tauri
- **Charting**: Recharts
- **Data**: React Query, SQL plugins

## License

[MIT](LICENSE)

## Support

For issues and feature requests, please [open an issue](https://github.com/skyronic/sqlmonitor/issues).
