import React from 'react';
import { Localized } from 'fluent-react';

export default function App() {
  const date = new Date();
  const linkA = <a href="http://example.com/A">A</a>;
  const linkB = <Localized id="link-to-b"><a href="http://example.com/B">B</a></Localized>;
  return (
    <div>
      <Localized id="title" $date={date}>
        <h1>{'Hello, world! Today is { $date }'}</h1>
      </Localized>
      <Localized
        id="welcome"
        $linkA={linkA}
        $linkB={linkB}>
        <p>{'Click { $linkA } or { $linkB}.'}</p>
      </Localized>
    </div>
  );
}
