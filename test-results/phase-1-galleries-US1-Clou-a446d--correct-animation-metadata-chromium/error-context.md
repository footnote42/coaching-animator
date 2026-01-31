# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "🏉 Coaching Animator" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: 🏉
        - generic [ref=e7]: Coaching Animator
    - generic [ref=e9]:
      - paragraph [ref=e11]: Rugby Play Visualisation
      - generic [ref=e13]:
        - heading "Sign In" [level=2] [ref=e14]
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: Email
            - textbox "Email" [ref=e18]:
              - /placeholder: coach@example.com
          - generic [ref=e19]:
            - generic [ref=e20]: Password
            - textbox "Password" [ref=e21]:
              - /placeholder: ••••••••
          - button "Sign In" [ref=e22]
        - link "Forgot password?" [ref=e24] [cursor=pointer]:
          - /url: /forgot-password
        - generic [ref=e25]:
          - text: Don't have an account?
          - link "Sign up" [ref=e26] [cursor=pointer]:
            - /url: /register
  - alert [ref=e27]
```