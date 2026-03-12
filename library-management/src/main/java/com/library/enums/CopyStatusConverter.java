package com.library.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Locale;

@Converter(autoApply = false)
public class CopyStatusConverter implements AttributeConverter<CopyStatus, String> {

    @Override
    public String convertToDatabaseColumn(CopyStatus attribute) {
        return attribute == null ? null : attribute.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public CopyStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        return CopyStatus.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
    }
}
