-- Admin DELETE policy on saved_animations
CREATE POLICY "Admins can delete animations"
  ON saved_animations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admin UPDATE policy on saved_animations (needed for "hide" action)
CREATE POLICY "Admins can update animations"
  ON saved_animations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admin UPDATE policy on user_profiles (needed for "ban_user" action)
CREATE POLICY "Admins can update user profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
