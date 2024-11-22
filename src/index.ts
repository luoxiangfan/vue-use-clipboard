import {
  computed,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';
import usePermission from 'vue-use-permission';

export interface UseClipboardOptions<Source> {
  navigator?: Navigator;
  legacy?: boolean;
  source?: Source;
}

export interface UseClipboardReturn<Optional> {
  isSupported: Ref<boolean>;
  text: ComputedRef<string>;
  copied: ComputedRef<boolean>;
  copy: Optional extends true
    ? (text?: string) => Promise<void>
    : (text: string) => Promise<void>;
}

function useClipboard(
  options?: UseClipboardOptions<undefined>
): UseClipboardReturn<false>;
function useClipboard(
  options: UseClipboardOptions<MaybeRefOrGetter<string>>
): UseClipboardReturn<true>;
function useClipboard(
  options: UseClipboardOptions<MaybeRefOrGetter<string> | undefined> = {}
): UseClipboardReturn<boolean> {
  const {
    navigator = window.navigator ?? undefined,
    source,
    legacy = false
  } = options;
  const isClipboardApiSupported = computed(
    () => navigator && 'clipboard' in navigator
  );
  const permissionWrite = usePermission('clipboard-write');
  const isSupported = computed(() => isClipboardApiSupported.value || legacy);
  const text = ref('');
  const copied = ref(false);

  async function copy(value = toValue(source)) {
    if (isSupported.value && value != null) {
      if (isClipboardApiSupported.value && isAllowed(permissionWrite.value)) {
        await navigator.clipboard.writeText(value);
      } else {
        legacyCopy(value);
      }
      text.value = value;
      copied.value = true;
    }
  }

  function legacyCopy(value: string) {
    const ta = document.createElement('textarea');
    ta.value = value ?? '';
    ta.style.position = 'absolute';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }

  function isAllowed(status: PermissionState | undefined) {
    return status === 'granted' || status === 'prompt';
  }

  return {
    isSupported,
    text: text as ComputedRef<string>,
    copied: copied as ComputedRef<boolean>,
    copy
  };
}

export default useClipboard;
