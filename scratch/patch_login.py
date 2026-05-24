import os

with open(r"c:\hr recruiter\frontend\src\pages\Login.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace <div className="form-group"> with <div className="auth-field">
content = content.replace('className="form-group"', 'className="auth-field"')

# Replace inline styles with class names for input wraps
content = content.replace(
    '''<div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>🛡️</span>
                      <input''',
    '''<div className="auth-input-wrap">
                      <span className="auth-input-icon">🛡️</span>
                      <input'''
)

content = content.replace(
    '''<div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>{mode === 'candidate' ? '✉️' : '👤'}</span>
                      <input''',
    '''<div className="auth-input-wrap">
                      <span className="auth-input-icon">{mode === 'candidate' ? '✉️' : '👤'}</span>
                      <input'''
)

content = content.replace(
    '''<div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>🔒</span>
                      <input''',
    '''<div className="auth-input-wrap">
                      <span className="auth-input-icon">🔒</span>
                      <input'''
)

# Remove the inline styles from inputs that were added
content = content.replace('style={{ paddingLeft: 40, width: \'100%\' }}', '')
content = content.replace('style={{ paddingLeft: 40, width: \'100%\' }}\n', '')

# Ensure password toggle buttons use the correct class
content = content.replace(
    '''<button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>''',
    '''<button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>'''
)

# Fix Button sizing and padding to look elegant
content = content.replace(
    '''<Button type="submit" loading={loading} style={{ width: '100%', marginTop: 4, padding: 14, fontSize: 14 }}>''',
    '''<Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8, padding: '14px 20px', fontSize: '15px' }}>'''
)
content = content.replace(
    '''<Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>''',
    '''<Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8, padding: '14px 20px', fontSize: '15px' }}>'''
)

with open(r"c:\hr recruiter\frontend\src\pages\Login.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Login.jsx patched successfully.")
