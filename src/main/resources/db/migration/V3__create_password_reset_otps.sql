-- V3: Create password_reset_otps table for real email OTP reset system
CREATE TABLE password_reset_otps (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_password_reset_otps_user_id ON password_reset_otps(user_id);
CREATE INDEX idx_password_reset_otps_user_created ON password_reset_otps(user_id, created_at DESC);
CREATE INDEX idx_password_reset_otps_user_active ON password_reset_otps(user_id, expires_at) WHERE used_at IS NULL;
