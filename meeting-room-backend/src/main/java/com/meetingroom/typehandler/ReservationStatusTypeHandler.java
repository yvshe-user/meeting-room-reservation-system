package com.meetingroom.typehandler;

import com.meetingroom.entity.Reservation;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ReservationStatusTypeHandler extends BaseTypeHandler<Reservation.ReservationStatus> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Reservation.ReservationStatus parameter,
                                    JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.ordinal());
    }

    @Override
    public Reservation.ReservationStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return fromOrdinal(rs.getInt(columnName), rs.wasNull());
    }

    @Override
    public Reservation.ReservationStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return fromOrdinal(rs.getInt(columnIndex), rs.wasNull());
    }

    @Override
    public Reservation.ReservationStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return fromOrdinal(cs.getInt(columnIndex), cs.wasNull());
    }

    private Reservation.ReservationStatus fromOrdinal(int ordinal, boolean wasNull) throws SQLException {
        if (wasNull) {
            return null;
        }
        Reservation.ReservationStatus[] values = Reservation.ReservationStatus.values();
        if (ordinal < 0 || ordinal >= values.length) {
            throw new SQLException("未知的预约状态值: " + ordinal);
        }
        return values[ordinal];
    }
}
