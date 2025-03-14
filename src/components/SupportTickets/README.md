# Support Tickets Components

This directory contains the components used in the Support Tickets page.

## Components

### ChatWidget

A floating chat widget that provides real-time customer support functionality.

```jsx
import { ChatWidget } from "./ChatWidget";

<ChatWidget
  maxMessageLength={500}
  maxMessages={50}
  onSend={(message) => console.log(message)}
/>;
```

#### Props

- `maxMessageLength` (number, optional): Maximum length of a message. Default: 500
- `maxMessages` (number, optional): Maximum number of messages to keep in history. Default: 50
- `onSend` (function, optional): Callback when a message is sent

### StatsCard

A card component that displays statistics with an icon and label.

```jsx
import { StatsCard } from "./StatsCard";

<StatsCard icon="📫" count={3} label="Total Tickets" />;
```

#### Props

- `icon` (string): Emoji or icon to display
- `count` (number): The statistic value to display
- `label` (string): Description of the statistic

### TicketsTable

A responsive table component that displays ticket information.

```jsx
import { TicketsTable } from "./TicketsTable";

<TicketsTable />;
```

### Header

The main navigation header for the support dashboard.

```jsx
import { Header } from "./Header";

<Header />;
```

## Mobile Responsiveness

All components are mobile-friendly and include:

- Responsive layouts
- Touch-friendly targets
- Appropriate font sizes for mobile
- Optimized table view for small screens
- Full-width chat on mobile devices

## Accessibility

Components include:

- ARIA labels
- Semantic HTML
- Keyboard navigation
- Focus management
- Screen reader support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
