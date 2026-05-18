import React, { forwardRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';

import { ansColors } from '../../theme/ansTheme';
import { loginIconInputStyles as styles } from './LoginIconInput.styles';

export type LoginIconInputProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  fieldError?: string;
  autoFocus?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  blurOnSubmit?: boolean;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIconColor?: string;
  rightIconA11yLabel?: string;
  onRightIconPress?: () => void;
  rightIconDisabled?: boolean;
};

const LoginIconInput = forwardRef<TextInput, LoginIconInputProps>(
  function LoginIconInput(
    {
      icon,
      placeholder,
      value,
      onChangeText,
      editable = true,
      secureTextEntry,
      autoCapitalize = 'none',
      autoCorrect = false,
      keyboardType = 'default',
      maxLength,
      fieldError,
      autoFocus,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit = false,
      rightIcon,
      rightIconColor,
      rightIconA11yLabel,
      onRightIconPress,
      rightIconDisabled = false,
    },
    ref
  ) {
    return (
      <View style={styles.field}>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={ansColors.gold}
            style={styles.inputIcon}
          />
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={ansColors.grayLight}
            value={value}
            onChangeText={onChangeText}
            autoFocus={autoFocus}
            editable={editable}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
            maxLength={maxLength}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
          />
          {rightIcon ? (
            <TouchableOpacity
              style={[
                styles.rightIconButton,
                rightIconDisabled && styles.rightIconButtonDisabled,
              ]}
              onPress={onRightIconPress}
              disabled={rightIconDisabled}
              accessibilityRole="button"
              accessibilityLabel={rightIconA11yLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={22}
                color={rightIconColor ?? ansColors.gray}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {!!fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
      </View>
    );
  }
);

export default LoginIconInput;
