package com.ecmp.tax.interceptor;

import com.alibaba.fastjson.JSONObject;
import com.ecmp.context.ContextUtil;
import com.ecmp.tax.exception.MessageRuntimeException;
import com.ecmp.vo.SessionUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @description: 登录用户拦截器
 * @author: wangdayin
 * @create: 2018/8/24.
 */
@Component
public class SessionUserTokenInterceptor extends HandlerInterceptorAdapter {
    public static final String AUTHORIZATION_KEY = "Authorization";
    private static Logger logger = LoggerFactory.getLogger(SessionUserTokenInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(AUTHORIZATION_KEY);
        SessionUser sessionUser = ContextUtil.getSessionUser();
        if (!StringUtils.isEmpty(token) && StringUtils.isEmpty(sessionUser.getTenantCode())){
            sessionUser = ContextUtil.getSessionUser(token);
        } else {
            sessionUser = ContextUtil.mockUser();
        }
        logger.info("当前登录用户======>" + JSONObject.toJSONString(sessionUser));
        return true;
    }
}
