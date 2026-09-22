package com.meetingroom.typehandler;

import com.meetingroom.entity.Confirmation;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;

public class ConfirmTypeTypeHandler extends BaseTypeHandler<Confirmation.ConfirmType> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Confirmation.ConfirmType parameter,
                                    JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name().toLowerCase(Locale.ROOT));
    }

    @Override
    public Confirmation.ConfirmType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parse(rs.getString(columnName));
    }

    @Override
    public Confirmation.ConfirmType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parse(rs.getString(columnIndex));
    }

    @Override
    public Confirmation.ConfirmType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parse(cs.getString(columnIndex));
    }

    private Confirmation.ConfirmType parse(String value) {
        return value == null ? null : Confirmation.ConfirmType.valueOf(value.toUpperCase(Locale.ROOT));
    }
}
