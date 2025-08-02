# Audio Files Directory (DEPRECATED)

⚠️ **This directory is now deprecated. Please refer to `/uploads/` for the new dynamic file storage.**

## Migration Notice

Audio files are no longer stored in the public folder. The new system uses:

- **Storage Location**: `/uploads/audio/` (outside public folder)
- **Serving Method**: Dynamic API routes at `/api/files/audio/[...path]`
- **Benefits**: No server restart required, immediate file access after upload

## Legacy Information

This directory previously stored audio files for the IELTS listening sections.
The old structure was:

- `/listening/` - Contains audio files for listening assessments

## Current Status

- ✅ New dynamic file serving implemented
- ✅ Migration to `/uploads/` directory complete
- ⚠️ This directory kept for reference only
