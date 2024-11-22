import type { UseClipboardOptions } from './index.js';
import useClipboard from './index.js';
import { defineComponent, reactive } from 'vue';

interface UseClipboardProps<Source = string>
  extends UseClipboardOptions<Source> {
  [x: string]: any;
}

export default defineComponent<UseClipboardProps>({
  name: 'UseClipboard',
  props: ['source', 'navigator', 'legacy'],
  setup(props, { slots }) {
    const data = reactive(useClipboard(props));
    return () => slots.default?.(data);
  }
});
