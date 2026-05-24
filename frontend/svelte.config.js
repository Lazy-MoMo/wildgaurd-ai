import adapter from '@sveltejs/adapter-node';

console.log('Adapter type:', typeof adapter);
console.log('Adapter value:', adapter);
console.log('Adapter result:', adapter());

const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;
