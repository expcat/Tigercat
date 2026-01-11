import { defineComponent, computed, h, ref, PropType } from 'vue';
import {
  classNames,
  avatarBaseClasses,
  avatarSizeClasses,
  avatarShapeClasses,
  avatarDefaultBgColor,
  avatarDefaultTextColor,
  avatarImageClasses,
  getInitials,
  type AvatarSize,
  type AvatarShape,
} from '@tigercat/core';

export interface VueAvatarProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  src?: string;
  alt?: string;
  text?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
  style?: Record<string, string | number>;
}

export const Avatar = defineComponent({
  name: 'TigerAvatar',
  inheritAttrs: false,
  props: {
    /**
     * Avatar size
     * @default 'md'
     */
    size: {
      type: String as PropType<AvatarSize>,
      default: 'md' as AvatarSize,
    },
    /**
     * Avatar shape
     * @default 'circle'
     */
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle' as AvatarShape,
    },
    /**
     * Image source URL
     */
    src: {
      type: String,
      default: undefined,
    },
    /**
     * Alternative text for image
     */
    alt: {
      type: String,
      default: '',
    },
    /**
     * Text content to display (e.g., initials)
     */
    text: {
      type: String,
      default: undefined,
    },
    /**
     * Background color for text/icon avatars
     */
    bgColor: {
      type: String,
      default: avatarDefaultBgColor,
    },
    /**
     * Text color for text/icon avatars
     */
    textColor: {
      type: String,
      default: avatarDefaultTextColor,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const imageError = ref(false);

    const hasImage = computed(() => Boolean(props.src) && !imageError.value);

    const avatarClasses = computed(() =>
      classNames(
        avatarBaseClasses,
        avatarSizeClasses[props.size],
        avatarShapeClasses[props.shape],
        !hasImage.value && props.bgColor,
        !hasImage.value && props.textColor
      )
    );

    const displayText = computed(() =>
      props.text ? getInitials(props.text) : ''
    );

    return () => {
      // Priority: image > text > icon (slot)

      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;
      const ariaLabelProp = attrsRecord['aria-label'] as string | undefined;
      const ariaLabelledbyProp = attrsRecord['aria-labelledby'] as
        | string
        | undefined;
      const ariaHiddenProp = attrsRecord['aria-hidden'] as boolean | undefined;

      const computedLabel =
        ariaLabelProp ??
        (props.alt.trim() ? props.alt : undefined) ??
        (props.text?.trim() || undefined);

      const isDecorative =
        ariaHiddenProp === true || (!computedLabel && !ariaLabelledbyProp);

      const baseSpanProps = {
        ...attrs,
        class: classNames(
          avatarClasses.value,
          props.className,
          attrsClass as any
        ),
        style: [attrsStyle as any, props.style as any],
      };

      // If src is provided and not errored, show image
      if (hasImage.value) {
        return h(
          'span',
          {
            ...baseSpanProps,
            'aria-hidden': isDecorative
              ? true
              : (attrsRecord['aria-hidden'] as any),
          },
          [
            h('img', {
              src: props.src,
              alt: props.alt,
              class: avatarImageClasses,
              onError: () => {
                imageError.value = true;
              },
            }),
          ]
        );
      }

      // If text is provided, show text
      if (displayText.value) {
        return h(
          'span',
          {
            ...baseSpanProps,
            ...(isDecorative
              ? { 'aria-hidden': true }
              : {
                  role: 'img',
                  'aria-label': computedLabel,
                  'aria-labelledby': ariaLabelledbyProp,
                }),
          },
          displayText.value
        );
      }

      // Otherwise, show icon from slot
      return h(
        'span',
        {
          ...baseSpanProps,
          ...(isDecorative
            ? { 'aria-hidden': true }
            : {
                role: 'img',
                'aria-label': computedLabel,
                'aria-labelledby': ariaLabelledbyProp,
              }),
        },
        slots.default ? slots.default() : undefined
      );
    };
  },
});

export default Avatar;
